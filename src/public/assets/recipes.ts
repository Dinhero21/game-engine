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
        type: 'stone',
        amount: 4
      }
    ],
    output: {
      type: 'hyperstone',
      amount: 1
    }
  }
]

export default recipes
