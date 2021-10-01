import "./App.css";
import { useMoralis } from "react-moralis";
import { useState } from "react";

function App() {
  const { authenticate, isAuthenticated, user } = useMoralis();
  const [scholarArray, setScholarArray] = useState([]);

  const setData = () => {
    user.set("scholarArray", [
      {
        name: "Bob",
        ronin: "ronin:328492308493028439243902",
      },
    ]);
    user.save();
    console.log(user.get("scholarArray"));
  };

  const addData = () => {
    user.addUnique("scholarArray", {
      name: "Pam",
      ronin: "ronin:7897987897878",
    });
    user.save();
    console.log(user.get("scholarArray"));
  };

  const delData = () => {
    user.remove("scholarArray", {
      name: "Pam",
      ronin: "ronin:7897987897878",
    });
    user.save();
    console.log(user.get("scholarArray"));
  };

  if (!isAuthenticated) {
    return (
      <div>
        <button onClick={() => authenticate()}>Authenticate</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Welcome {user.get("username")}</h1>
      <button onClick={() => setData()}>Set Data</button>
      <button onClick={() => addData()}>Add Data</button>
      <button onClick={() => delData()}>Delete Data</button>
    </div>
  );
}

export default App;
