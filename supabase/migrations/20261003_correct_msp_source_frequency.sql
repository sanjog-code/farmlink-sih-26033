-- Correct the source label for deployments that received the previous
-- migration. MSP notifications are seasonal, not a daily government feed.
update public.msp_source_status
set update_frequency = 'Seasonal official notification',
    note = 'MSP applies only where the Government has issued a current crop and season notification. The interface shows the verification date and official notice. Daily mandi prices are separate market data.'
where id = true;
