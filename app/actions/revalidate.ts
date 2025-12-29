'use server'

import { revalidatePath } from 'next/cache'

/**
 * Revalidates core application paths to ensure fresh data fetching.
 * Called after critical data mutations (uploads, deletions).
 */
export async function revalidateApp() {
    revalidatePath('/dashboard')
    revalidatePath('/experiments')
    revalidatePath('/upload')
    revalidatePath('/', 'layout') // Revalidate everything just in case
}
