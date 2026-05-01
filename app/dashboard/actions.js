'use server'

import { getUserDb } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function addHolding(formData) {
  const supabase = await getUserDb()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const asset_name = formData.get('asset_name')
  const asset_type = formData.get('asset_type')
  const quantity = parseFloat(formData.get('quantity'))
  const purchase_price = parseFloat(formData.get('purchase_price'))

  // Check if holding already exists
  const { data: existingHolding, error: fetchError } = await supabase
    .from('holdings')
    .select('id, quantity, purchase_price')
    .eq('asset_name', asset_name)
    .eq('asset_type', asset_type)
    .eq('user_id', user.id)
    .single()

  if (existingHolding) {
    // Calculate average price
    const totalQuantity = existingHolding.quantity + quantity
    const totalCost = (existingHolding.quantity * existingHolding.purchase_price) + (quantity * purchase_price)
    const averagePrice = totalCost / totalQuantity

    const { error } = await supabase
      .from('holdings')
      .update({
        quantity: totalQuantity,
        purchase_price: averagePrice
      })
      .eq('id', existingHolding.id)

    if (error) {
      console.error('Error updating holding:', error)
      throw new Error('Failed to update holding')
    }
  } else {
    // Insert new holding
    const { error } = await supabase.from('holdings').insert({
      user_id: user.id,
      asset_name,
      asset_type,
      quantity,
      purchase_price
    })

    if (error) {
      console.error('Error adding holding:', error)
      throw new Error('Failed to add holding')
    }
  }

  revalidatePath('/dashboard')
}

export async function deleteHolding(formData) {
  const supabase = await getUserDb()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const id = formData.get('id')

  const { error } = await supabase.from('holdings').delete().eq('id', id).eq('user_id', user.id)

  if (error) {
    console.error('Error deleting holding:', error)
    throw new Error('Failed to delete holding')
  }

  revalidatePath('/dashboard')
}

export async function sellHolding(formData) {
  const supabase = await getUserDb()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const id = formData.get('id')
  const sellQuantity = parseFloat(formData.get('quantity'))

  if (isNaN(sellQuantity) || sellQuantity <= 0) {
    throw new Error('Invalid quantity')
  }

  // Get current quantity
  const { data: holding, error: fetchError } = await supabase
    .from('holdings')
    .select('quantity')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !holding) {
    throw new Error('Holding not found')
  }

  const newQuantity = holding.quantity - sellQuantity

  if (newQuantity <= 0) {
    // Delete if quantity becomes 0 or less
    const { error: deleteError } = await supabase
      .from('holdings')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (deleteError) throw deleteError
  } else {
    // Update quantity
    const { error: updateError } = await supabase
      .from('holdings')
      .update({ quantity: newQuantity })
      .eq('id', id)
      .eq('user_id', user.id)
    if (updateError) throw updateError
  }

  revalidatePath('/dashboard')
}

export async function addCash(formData) {
  const quantity = parseFloat(formData.get('quantity'))
  const id = formData.get('id')
  
  const supabase = await getUserDb()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Get current cash holding
  const { data: holding } = await supabase.from('holdings').select('*').eq('id', id).single()
  if (!holding) throw new Error('Cash holding not found')

  const { error } = await supabase.from('holdings').update({
    quantity: holding.quantity + quantity
  }).eq('id', id)

  if (error) throw error
  revalidatePath('/dashboard')
}

export async function logout() {

  const supabase = await getUserDb()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
}
