import { Database } from './types/database.types'

type TableNames = keyof Database['public']['Tables']
const name: TableNames = 'profiles'
console.log(name)
