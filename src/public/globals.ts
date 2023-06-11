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
    tree: true,
    path: false,
    collider: false
  }
}

export const globals = {
  camera: Camera,
  frame: Frame,
  debug: Debug
}

export default globals
