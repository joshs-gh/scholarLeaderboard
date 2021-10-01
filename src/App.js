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
  const [visibleDialog, setVisibleDialog] = useState(false);
  const name = useRef(null);
  const ronin = useRef(null);

  useEffect(() => {
    if (user) {
      let scholars = user.get("scholarArray");
      console.log("SCHOLARS: ", scholars);
      scholars.forEach((s) => {
        fetch(`${SLPAPI}${s.ronin}`)
          .then((response) => response.json())
          .then((data) => console.log(data));
      });
      setScholarArray(scholars);
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
          {s.name}
          {s.ronin}
          <p />
        </div>
      ))}
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
