import React, { useState, useRef } from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";

function AddScholarModal({
  user,
  openAS,
  setOpenAS,
  scholarArray,
  setScholarArray,
  refreshSLP,
}) {
  const handleCloseAS = () => {
    setOpenAS(false);
    setRoninError(false);
    setNameError(false);
    setNewAS(true);
  };
  const name = useRef(null);
  const ronin = useRef(null);
  const [roninError, setRoninError] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [newAS, setNewAS] = useState(true);

  const validateName = () => {
    setNameError(false);
    if (name.current.value.length === 0) setNameError(true);
  };

  const validateRonin = () => {
    setRoninError(false);
    if (
      ronin.current.value.substring(0, 6) !== "ronin:" ||
      ronin.current.value.length !== 46
    )
      setRoninError(true);
    setNewAS(false);
  };

  const addScholar = () => {
    let scholar = {
      name: name.current.value,
      ronin: ronin.current.value,
    };
    console.log("Adding Scholar: ", scholar);
    user.add("scholarArray", scholar);
    user.save();
    setScholarArray([...scholarArray, scholar]);
    handleCloseAS();
    refreshSLP([...scholarArray, scholar]);
  };

  return (
    <div>
      <Modal open={openAS} onClose={handleCloseAS}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 490,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
            textAlign: "center",
          }}
        >
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            style={{ marginBottom: "5px" }}
          >
            Add Scholar{" "}
          </Typography>
          <TextField
            error={nameError}
            helperText={nameError ? "Please provide a name" : ""}
            label="Name"
            variant="outlined"
            margin="normal"
            fullWidth
            inputRef={name}
            onChange={validateName}
          />
          <TextField
            error={roninError}
            helperText={
              roninError ? "Please provide a valid ronin address" : ""
            }
            label="Ronin Wallet"
            variant="outlined"
            margin="normal"
            fullWidth
            inputRef={ronin}
            onChange={validateRonin}
          />
          <Button
            variant="contained"
            color="info"
            style={{ margin: "10px" }}
            onClick={() => addScholar()}
            disabled={newAS || roninError || nameError}
          >
            Save
          </Button>
          <Button variant="outlined" onClick={handleCloseAS}>
            Cancel
          </Button>
        </Box>
      </Modal>
    </div>
  );
}

export default AddScholarModal;
