import React, { useState } from 'react';
import { Modal, ModalDialog, ModalClose, IconButton, Box, Typography } from '@mui/joy';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import { useRouter } from 'next/router';
import { useAuth } from '~/common/auth/AuthContext';
import { auth } from '../../../../firebase';
import { signOut } from 'firebase/auth';
import { addSnackbar } from '~/common/components/snackbar/useSnackbarsStore';

const noBackdropSlotProps = {
  backdrop: {
    sx: {
      backdropFilter: 'none',
    },
  },
};

const dialogSx = {
  position: 'absolute',
  top: '2.5rem',
  left: '90%',
  transform: 'translateX(-50%)',
  minWidth: 100,
  maxWidth: 700,
};

function UserPopup() {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    console.log(auth.currentUser?.email);
  };

  return (
    <div style={{ position: 'relative' }}>
      <IconButton onClick={handleOpen}>
        <PersonIcon />
      </IconButton>
      <Modal open={open} onClose={handleClose} slotProps={noBackdropSlotProps}>
        <ModalDialog sx={dialogSx}>
          <Box display="flex" alignItems="center" gap={1}>
            <EmailIcon />
            <Typography level="title-sm">
              {auth.currentUser?.email}
            </Typography>
          </Box>
        </ModalDialog>
      </Modal>
    </div>
  );
}

export default UserPopup;