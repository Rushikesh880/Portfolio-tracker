const { loadEnvConfig } = require('@next/env');
loadEnvConfig('./', process.env.NODE_ENV !== 'production');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const { data: userResp } = await supabase.auth.admin.listUsers();
  const users = userResp?.users || [];
  if (users.length === 0) {
    console.log("No users found.");
    return;
  }
  const userId = users[0].id;
  console.log("Using user ID:", userId);
  
  const { error } = await supabase.from('holdings').insert({
    user_id: userId,
    asset_name: 'TEST',
    asset_type: 'STOCK',
    quantity: 1,
    purchase_price: 1
  });
  
  if (error) {
    console.error("Insert error:", error);
  } else {
    console.log("Insert success!");
  }
}
test();
