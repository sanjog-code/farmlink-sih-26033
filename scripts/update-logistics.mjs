import fs from 'fs';

const filePath = 'src/operations/LogisticsWorkflowHub.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const startMarker = 'export const INITIAL_SHIPMENTS = [';
const endMarker = 'export default function LogisticsWorkflowHub({ notify }) {';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `export const INITIAL_SHIPMENTS = [];

export default function LogisticsWorkflowHub({ notify }) {
  const [shipments, setShipments] = useState(() => getShipments());
  const [isCreatingShipment, setIsCreatingShipment] = useState(false);
  const [newShipment, setNewShipment] = useState({
    crop: 'Mustard',
    quantityKg: '500',
    farmer: 'Verified Producer Cluster',
    originCluster: 'Jaipur North Mandi Cluster',
    destinationWarehouse: 'Jaipur North WDRA Hub',
    finalDestination: 'Consumer Distribution Center',
    coldChain: false
  });

  useEffect(() => {
    const unsub = subscribeToSync(() => {
      setShipments(getShipments());
    });
    return unsub;
  }, []);
`;

  const afterEnd = content.slice(endIndex + endMarker.length);
  // remove the old state declaration
  const cleanAfterEnd = afterEnd.replace(/\r?\n\s*const \[shipments, setShipments\] = useState\(INITIAL_SHIPMENTS\);/, '');

  content = content.slice(0, startIndex) + replacement + cleanAfterEnd;
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated LogisticsWorkflowHub.jsx');
} else {
  console.error('Markers not found', { startIndex, endIndex });
}
