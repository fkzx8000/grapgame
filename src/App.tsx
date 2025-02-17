import { useState } from "react";
import GraphGame from "./GraphGame/GraphGame";
import GraphGameKruskal from "./KruskalGame/GraphGameKruskal";
import BFSDFSGame from "./BFSDFS/BFSDFSGame";
import "./App.css";

const components = {
  graph: GraphGame,
  kruskal: GraphGameKruskal,
  bfsdfs: BFSDFSGame,
};

function App() {
  const [selectedComponent, setSelectedComponent] = useState<
    keyof typeof components | null
  >(null);
  const [showBubbles, setShowBubbles] = useState(true);

  const handleClose = () => {
    setSelectedComponent(null);
    setShowBubbles(false);
    setTimeout(() => setShowBubbles(true), 10);
  };

  const renderComponent = () => {
    const Component = components[selectedComponent!];
    return (
      <div className="component-container">
        <button className="close-button" onClick={handleClose}>
          ✕
        </button>
        <Component />
      </div>
    );
  };

  return (
    <div className="app">
      {selectedComponent
        ? renderComponent()
        : showBubbles && (
            <div className="bubbles-system">
              {/* בועה מרכזית */}
              <div className="bubble-center glow">
                <div className="logo">⚛️</div>
              </div>

              {/* בועות במסלולים מעגליים */}
              {(Object.keys(components) as (keyof typeof components)[]).map(
                (key, index) => (
                  <button
                    key={key}
                    className="bubble-orbit"
                    onClick={() => setSelectedComponent(key)}
                    style={
                      {
                        "--orbit-radius": `${150 + index * 100}px`,
                        "--start-angle": `${index * 120}deg`,
                      } as React.CSSProperties
                    }
                  >
                    <span className="bubble-text">
                      {components[key].name.replace("Game", "")}
                    </span>
                  </button>
                )
              )}
            </div>
          )}
    </div>
  );
}

export default App;
