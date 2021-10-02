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
  // console.log("URLDATA", urlData, error);

  useEffect(() => {
    async function fetchSLP(ronin) {
      try {
        const response = await fetch(`${SLPAPI}${ronin}`);
        const slp = await response.json();
        return slp;
      } catch (error) {
        console.log("Fetch error: ", error);
      }
    }
    uid.length > 10 && setReadonly(true);
    let scholars = [];
    // console.log("USER", user);
    if (user) {
      setReadonly(false);
      scholars = user.get("scholarArray");
      var acl = new Moralis.ACL();
      acl.setPublicReadAccess(true);
      user.setACL(acl);
      user.save();
    }
    if (readonly && urlData) {
      scholars = urlData.scholarArray;
    }
    // console.log("SCHOLARS:", scholars);
    setScholarArray([...scholars]); // this creates a new array ref apparently
    setScholarCount(scholars.length);
    scholars.forEach((s) => {
      fetchSLP(s.ronin).then((data) => {
        s["slp"] = data.earnings.slp_inventory;
        s["avgslp"] = Math.floor(
          data.earnings.slp_inventory /
            ((Date.now() / 1000 - data.earnings.last_claimed) / 86400)
        );
        setScholarArray(
          scholars.sort((a, b) => (a.avgslp < b.avgslp ? 1 : -1))
        );
      });
    });
  }, [data, user]);

  const toggleDialog = () => {
    setVisibleDialog(!visibleDialog);
  };
  const addScholar = () => {
    let scholar = {
      name: name.current.state.value,
      ronin: ronin.current.state.value,
    };
    setScholarArray([...scholarArray, scholar]);
    user.add("scholarArray", scholar);
    user.save();
    toggleDialog();
  };

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
          {id + 1} / {s.name} / {s.ronin} / {s.slp ? s.slp : "Loading..."} /{" "}
          {s.avgslp ? s.avgslp : "Loading..."}
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
