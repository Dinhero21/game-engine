export interface Slot {
  type: string
  amount: number
}

export interface Recipe {
  inputs: Slot[]
  output: Slot
}

export const recipes: Recipe[] = [
  {
    inputs: [
      {
        type: 'sus',
        amount: 1
      }
    ],
    output: {
      type: 'sus',
      amount: 1
    }
  }
]

export default recipes
