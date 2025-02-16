# GraphFlow Game

GraphFlow Game is an interactive React project built with TypeScript that simulates the Edmonds-Karp algorithm for computing the maximum flow in a flow network. Users can build a flow network manually or generate a random one, set the source (labeled **s**) and sink (labeled **t**), and then simulate the flow process by selecting augmenting paths. An automatic solver is also available that displays the step-by-step augmentation until the network reaches its maximum flow.

## Overview

### What Does the Project Do?

- **Graph Construction:**  
  Users can add nodes and directed edges with specified capacities.
- **Source and Sink Assignment:**  
  Users can designate a source node (displayed as **s** with a light blue fill) and a sink node (displayed as **t** with a light red fill). Only one source and one sink are allowed.
- **Flow Simulation:**  
  In simulation mode, users select an augmenting path from the source to the sink, and the system updates the flow along the path.
- **Automatic Solving:**  
  The automatic solver uses the Edmonds-Karp algorithm (a BFS-based implementation of the Ford-Fulkerson method) to incrementally find augmenting paths and update the flow. The step-by-step solution is displayed.

### Theoretical Background

- **Flow Network:**  
  A directed graph where each edge has a capacity. The flow passing through an edge cannot exceed its capacity.
- **Augmenting Path:**  
  A path from the source (s) to the sink (t) in the residual graph where additional flow can be pushed.

- **Edmonds-Karp Algorithm:**  
  An implementation of the Ford-Fulkerson method that uses Breadth-First Search (BFS) to find the shortest augmenting paths, ensuring a polynomial-time solution for maximum flow.

- **Max-Flow Min-Cut Theorem:**  
  A fundamental theorem stating that the maximum flow in a network equals the capacity of the minimum cut that separates the source and the sink.

## File Structure

The **GraphGame** folder contains the following files:

```

GraphGame/
├── GraphGame.tsx // The main component that manages the state and logic of the game.
├── Toolbar.tsx // The toolbar component displaying buttons for editing and simulation modes.
├── StatusBar.tsx // Displays the current flow, potential additional flow, and messages to the user.
├── GraphCanvas.tsx // Renders the SVG canvas for the graph, including nodes and edges.
├── GraphCanvasTypes.ts // Contains TypeScript interfaces (NodeType and EdgeType).
├── Node.tsx // Component for rendering an individual node (circle with centered label).
├── Edge.tsx // Component for rendering an edge. If opposite (bidirectional) edges exist,
│ // it draws two arcs (one curved upward and one downward) to clearly show flow.
├── SolutionSteps.tsx // Displays the step-by-step solution (the augmenting paths and their bottlenecks).
└── GraphGame.css // CSS file for styling the project.

```

Additionally, the **App.tsx** file (located in the `src` folder) imports and uses the `GraphGame` component.

## Installation and Usage

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/fkzx8000/graphflow-game.git
   cd graphflow-game
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Run the Development Server:**

   ```bash
   npm run dev
   ```

   Then open [http://localhost:5173](http://localhost:5173) in your browser.

4. **How to Use:**
   - In **Edit Mode**, use the toolbar to add nodes and edges.
   - Click the **Add s,t** button to automatically add a source (s) and a sink (t). Only one source and one sink can be defined.
   - Switch to **Simulation Mode** to select augmenting paths manually and update the flow.
   - Use the **Automatic Solve** button to run the Edmonds-Karp algorithm step-by-step.

## Graph Theory Concepts

- **Flow Network:** A directed graph with capacities on its edges, where the flow along each edge cannot exceed its capacity.
- **Augmenting Path:** A path from the source to the sink in the residual graph where additional flow can be added.
- **Edmonds-Karp Algorithm:** Uses BFS to find the shortest augmenting paths, ensuring that the maximum flow is reached efficiently.
- **Max-Flow Min-Cut Theorem:** States that the maximum flow of a network is equal to the minimum capacity that, when removed, would disconnect the source from the sink.

## Contributing

Contributions are welcome! If you have suggestions for improvements or encounter any bugs, please open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

---

Feel free to adjust the text as needed. This README provides an overview of the project, explains the theoretical background, lists the file structure for the **GraphGame** folder, and includes installation and usage instructions suitable for GitHub.
