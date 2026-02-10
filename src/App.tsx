import Globe from "./components/Globe/Globe";
import Rivers from "./components/Rivers/Rivers";
import RiverLabels from "./components/Rivers/RiverLabels";
import Sidebar from "./components/Sidebar/Sidebar";
import CoordinateDisplay from "./components/CoordinateDisplay/CoordinateDisplay";

function App() {
  return (
    <Globe>
      <Rivers />
      <RiverLabels />
      <CoordinateDisplay />
      <Sidebar />
    </Globe>
  );
}

export default App;
