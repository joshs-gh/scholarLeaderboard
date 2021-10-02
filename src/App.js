import "@progress/kendo-theme-bootstrap/dist/all.css";
import "./App.css";
import { useMoralis } from "react-moralis";
import { useState, useRef, useEffect } from "react";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Input } from "@progress/kendo-react-inputs";

function App() {
  const SLPAPI = "https://api.lunaciaproxy.cloud/_earnings/";
  const { authenticate, isAuthenticated, user, logout, isAuthenticating } =
    useMoralis();
  const [scholarArray, setScholarArray] = useState([]);
  const [scholarCount, setScholarCount] = useState(0);
  const [visibleDialog, setVisibleDialog] = useState(false);
  const name = useRef(null);
  const ronin = useRef(null);

  useEffect(() => {
    async function fetchSLP(ronin) {
      const response = await fetch(`${SLPAPI}${ronin}`);
      const slp = await response.json();
      console.log(slp);
      return slp;
    }
    if (user) {
      let scholars = user.get("scholarArray");
      scholars.forEach((s) => {
        fetchSLP(s.ronin).then((data) => {
          console.log("Updating for ronin: ", s.ronin);
          s["slp"] = data.earnings.slp_inventory;
          setScholarArray([...scholars]);
          setScholarCount(scholars.length);
        });
      });
      console.log("SCHOLARS: ", scholars);
    }
  }, [user]);

  const toggleDialog = () => {
    setVisibleDialog(!visibleDialog);
  };
  const addScholar = () => {
    let scholar = {
      name: name.current.state.value,
      ronin: ronin.current.state.value,
    };
    console.log(scholar);
    setScholarArray([...scholarArray, scholar]);
    user.add("scholarArray", scholar);
    user.save();
    toggleDialog();
  };

  if (!isAuthenticated) {
    return (
      <div>
        <button onClick={() => authenticate()}>
          Authenticate with Metamask
        </button>
      </div>
    );
  }

  return (
    <div>
      {scholarArray.map((s, id) => (
        <div key={id}>
          {s.name} / {s.ronin} / {s.slp ? s.slp : "Loading..."}
          <p />
        </div>
      ))}
      Scholar Count: {scholarCount}
      <p />
      <button onClick={() => setVisibleDialog(!visibleDialog)}>
        Add a Scholar
      </button>
      <button onClick={() => logout()} disabled={isAuthenticating}>
        Logout
      </button>
      {visibleDialog && (
        <Dialog title={"Add Scholar"} onClose={toggleDialog}>
          <p
            style={{
              margin: "25px",
              textAlign: "center",
            }}
          >
            Enter Scholar Info:{" "}
          </p>
          <Input placeholder="Name" ref={name} />
          <p />
          <Input placeholder="Ronin Wallet" ref={ronin} />
          <DialogActionsBar>
            <button className="k-button" onClick={addScholar}>
              Save
            </button>
            <button className="k-button" onClick={toggleDialog}>
              Cancel
            </button>
          </DialogActionsBar>
        </Dialog>
      )}
    </div>
  );
}

export default App;

// const setData = () => {
//   user.set("scholarArray", [
//     {
//       name: "Bob",
//       ronin: "ronin:328492308493028439243902",
//     },
//   ]);
//   user.save();
//   console.log(user.get("scholarArray"));
// };

// const addData = () => {
//   user.addUnique("scholarArray", {
//     name: "Pam",
//     ronin: "ronin:7897987897878",
//   });
//   user.save();
//   console.log(user.get("scholarArray"));
// };

// const delData = () => {
//   user.remove("scholarArray", {
//     name: "Pam",
//     ronin: "ronin:7897987897878",
//   });
//   user.save();
//   console.log(user.get("scholarArray"));
// };
