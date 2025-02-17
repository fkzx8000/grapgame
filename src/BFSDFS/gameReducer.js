export const initialState = {
  nodes: [],
  edges: [],
  visited: new Set(),
  path: [],
  bfsQueue: [],
  dfsStack: [],
  currentAlgorithm: null,
  isPlaying: false,
  message: "",
  currentNode: null,
  isAddingEdge: false,
};

export const gameReducer = (state, action) => {
  switch (action.type) {
    case "INIT_NODES":
      return { ...state, nodes: action.payload };

    case "ADD_NODE":
      return {
        ...state,
        nodes: [...state.nodes, action.payload],
      };

    case "ADD_EDGE": {
      const { from, to } = action.payload;
      const existingEdge = state.edges.some(
        (e) =>
          (e.from === from && e.to === to) || (e.from === to && e.to === from)
      );

      if (existingEdge) {
        return { ...state, message: "צלע כבר קיימת!" };
      }

      const updatedNodes = state.nodes.map((node) => {
        if (node.id === from && !node.neighbors.includes(to)) {
          return { ...node, neighbors: [...node.neighbors, to] };
        }
        if (node.id === to && !node.neighbors.includes(from)) {
          return { ...node, neighbors: [...node.neighbors, from] };
        }
        return node;
      });

      return {
        ...state,
        nodes: updatedNodes,
        edges: [...state.edges, { from, to }],
        message: "",
      };
    }

    case "SET_START_NODE":
      return {
        ...state,
        nodes: state.nodes.map((n) => ({
          ...n,
          isStart: n.id === action.payload,
        })),
        message: "",
      };

    case "SET_ALGORITHM":
      return { ...state, currentAlgorithm: action.payload };

    case "TOGGLE_EDGE_MODE":
      return { ...state, isAddingEdge: !state.isAddingEdge };

    case "START_ALGORITHM": {
      const startNode = state.nodes.find((n) => n.isStart);
      if (!startNode) {
        return { ...state, message: "יש לבחור צומת התחלתי!" };
      }

      return {
        ...state,
        isPlaying: true,
        visited: new Set(),
        path: [],
        bfsQueue: state.currentAlgorithm === "BFS" ? [startNode] : [],
        dfsStack: state.currentAlgorithm === "DFS" ? [startNode] : [],
        message: "",
      };
    }

    case "NEXT_STEP": {
      if (!state.isPlaying) return state;

      if (state.currentAlgorithm === "BFS" && state.bfsQueue.length > 0) {
        const [current, ...rest] = state.bfsQueue;
        const neighbors = current.neighbors
          .map((id) => state.nodes.find((n) => n.id === id))
          .filter((n) => !state.visited.has(n.id));

        return {
          ...state,
          visited: new Set([...state.visited, current.id]),
          path: [...state.path, current.id],
          bfsQueue: [...rest, ...neighbors],
          currentNode: current.id,
        };
      }

      if (state.currentAlgorithm === "DFS" && state.dfsStack.length > 0) {
        const [current, ...rest] = state.dfsStack;
        const neighbors = current.neighbors
          .map((id) => state.nodes.find((n) => n.id === id))
          .filter((n) => !state.visited.has(n.id))
          .reverse();

        return {
          ...state,
          visited: new Set([...state.visited, current.id]),
          path: [...state.path, current.id],
          dfsStack: [...neighbors, ...rest],
          currentNode: current.id,
        };
      }

      return { ...state, isPlaying: false };
    }

    case "RESET":
      return { ...initialState, nodes: state.nodes, edges: state.edges };

    case "SET_MESSAGE":
      return { ...state, message: action.payload };

    default:
      return state;
  }
};
