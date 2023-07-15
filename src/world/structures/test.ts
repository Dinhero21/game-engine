import Structure from './base'
import { type StructureHelper } from './handler'
import Tiles from '../tiles'
import figlet from 'figlet'

// Thank you GPT-4
const POEM =
`
In a realm where logic alone holds sway,
Beneath the silicon sky, in circuits’ array,
There exists a structure, born from code's quest,
A maze intricate, the debug test.

Binary whispers echo in the vast network's night,
Through lines of code, in silence take flight.
A labyrinth in silicon, pulsing, alive,
In this complex structure, the bytes strive.

Guardian of the system, protector of flow,
Against the chaos that lurks below.
The sentinel unseen, its vigil never rests,
Ever watchful, in the debug test.

Through endless loops, and logic gates,
The structure scans, it contemplates,
In search of flaws hidden deep within,
A hunter silent, amidst the din.

Errors emerge like ghosts in the machine,
Unseen, unheard, until they glean
The eye of the structure, unblinking, stark,
Lighting the shadows, dispelling the dark.

When anomaly strikes, in data's sea,
It's caught in the net of the debug decree.
It quivers, exposed, its form grotesque,
Conquered by the rigour of the debug test.

The structure unravels the tangled knot,
Beneath the surface, in the secret plot,
Revealing truths that once were blind,
In binary streams, in the heart of the mind.

A silent sentinel in the code's deep sea,
Navigates the vast complexity,
From chaos to order, it manifests,
The unsung hero, the debug test.

So here's to the crafters of this maze,
Who weave their magic in code's phrase.
In the heart of silicon, where they manifest,
Stand the architects of the debug test.
`.trim()

const TEXT = figlet.textSync(
  POEM,
  {
    font: 'ANSI Regular'
  }
)

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TestStructureProperties {}

export class TestStructure extends Structure<TestStructureProperties> {
  public create (helper: StructureHelper): void {
    const LINES = TEXT.split('\n')

    for (let y = 0; y < LINES.length; y++) {
      const line = LINES[y]

      for (let x = 0; x < line.length; x++) {
        const character = line[x]

        let tile = Tiles.air

        if (character !== ' ') tile = Tiles.stone

        helper.setTile(tile, x, y)
      }
    }
  }
}

export default TestStructure
