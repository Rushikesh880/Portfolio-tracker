const { schedule } = require('@netlify/functions');

const handler = async (event, context) => {
  console.log("Scheduled price update started...");
  
  // Netlify provides the site URL in process.env.URL during the build/runtime
  // For Next.js on Netlify, we usually target the absolute URL
  const siteUrl = process.env.URL || 'https://stockbeaconlive.netlify.app'; 
  
  try {
    const response = await fetch(`${siteUrl}/api/prices/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer CRON_SECRET'
      }
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log("Prices updated successfully:", result);
    } else {
      console.error("Failed to update prices:", result);
    }
  } catch (error) {
    console.error("Error triggering price update:", error);
  }

  return {
    statusCode: 200,
  };
};

// Runs every 5 minutes
module.exports.handler = schedule('*/5 * * * *', handler);
