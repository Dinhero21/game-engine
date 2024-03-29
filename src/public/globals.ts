export const Camera = {
  integer_approximation: true
}

export const Frame = {
  integer_approximation: {
    frame: false,
    canvas: true
  }
}

// TODO: Make these configurable
export const Debug = {
  camera: {
    movable: false
  },
  entity: {
    tree: false,
    path: false,
    collider: false
  },
  frame: {
    outline_drawImage: false
  },
  player: {
    collision: true,
    gravity: true
  }
}

export const Experiments = {
  '3d': false,
  cursed_water: false
}

export const globals = {
  camera: Camera,
  frame: Frame,
  debug: Debug,
  experiments: Experiments
}

declare global {
  interface Window {
    globals: typeof globals
  }
}

window.globals = globals

export default globals
