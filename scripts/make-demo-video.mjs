import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
const names=['01-home','02-marketplace','04-warehouse','05-live-ledger','06-farmer','07-ai-pricing','08-voice'];
const ffmpeg='C:\\Users\\ASUS\\AppData\\Local\\ms-playwright\\ffmpeg-1011\\ffmpeg-win64.exe';
const proc=spawn(ffmpeg,['-y','-f','image2pipe','-vcodec','mjpeg','-r','30','-i','pipe:0','-c:v','libvpx','-b:v','2M','outputs/FarmLink_SIH_Demo.webm'],{stdio:['pipe','inherit','inherit']});
for(const name of names){const image=await readFile(`work/demo-frames/${name}.jpg`);for(let i=0;i<(name==='08-voice'?120:90);i++)proc.stdin.write(image);}
proc.stdin.end();
await new Promise((resolve,reject)=>proc.on('close',code=>code===0?resolve():reject(new Error(`ffmpeg exited ${code}`))));
