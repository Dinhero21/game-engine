
export interface Recipe {
  output: {
    name: string
    amount: number
  }
}

export const recipes: Recipe[] = [
  {
    output: {
      name: 'test',
      amount: 1
    }
  }
]

export default recipes
