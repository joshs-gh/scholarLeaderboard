import "@progress/kendo-theme-bootstrap/dist/all.css";
import "./App.css";
import { useMoralis, useMoralisQuery } from "react-moralis";
import { useState, useRef, useEffect } from "react";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Input } from "@progress/kendo-react-inputs";
const Moralis = require("moralis");

function App() {
  const SLPAPI = "https://api.lunaciaproxy.cloud/_earnings/";
  const { authenticate, isAuthenticated, user, logout, isAuthenticating } =
    useMoralis();
  const [scholarArray, setScholarArray] = useState([]);
  const [scholarCount, setScholarCount] = useState(0);
  const [visibleDialog, setVisibleDialog] = useState(false);
  const [readonly, setReadonly] = useState(false);
  const name = useRef(null);
  const ronin = useRef(null);
  let uid = window.location.href.split("/").pop(); // eg. http://localhost:3000/JCmVv8nRMcHZqFgHQFmNXTo5
  const { data, error, isLoading } = useMoralisQuery("User", (query) =>
    query.equalTo("objectId", uid)
  );
  const urlData = JSON.parse(JSON.stringify(data, null, 2))[0]; // wtf is this object?  can't figure out how to parse w/o this hack
  console.log("URLDATA", urlData);

  useEffect(() => {
    async function fetchSLP(ronin) {
      const response = await fetch(`${SLPAPI}${ronin}`);
      const slp = await response.json();
      return slp;
    }
    uid.length > 10 && setReadonly(true);
    let scholars = [];
    console.log("USER", user);
    if (user) {
      setReadonly(false);
      scholars = user.get("scholarArray");
    }
    if (readonly && urlData) {
      scholars = urlData.scholarArray;
    }
    console.log("SCHOLARS:", scholars);
    setScholarArray([...scholars]);
    setScholarCount(scholars.length);
    scholars.forEach((s) => {
      fetchSLP(s.ronin).then((data) => {
        s["slp"] = data.earnings.slp_inventory;
        setScholarArray([...scholars]); // this creates a new array ref apparently
      });
    });
  }, [data]);

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

  if (isAuthenticated) {
    user.setACL(new Moralis.ACL().setPublicReadAccess(true)); // no idea if this is working - need a new metamask
  }

  if (!isAuthenticated && !readonly) {
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
      {!readonly && (
        <div>
          <button onClick={() => setVisibleDialog(!visibleDialog)}>
            Add a Scholar
          </button>
          <button onClick={() => logout()} disabled={isAuthenticating}>
            Logout
          </button>
        </div>
      )}
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
