import {
  Dialog,
  DialogTitle,
  IconButton,
  Box,
  DialogContent,
} from '@mui/material';
import { ReactNode } from 'react';
import { Close } from '@mui/icons-material';

interface SimpleDialogProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}

const SimpleDialog = (props: SimpleDialogProps) => {
  const { onClose, open, children, title } = props;

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog onClose={handleClose} open={open} maxWidth='md' fullWidth>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <DialogTitle>{title}</DialogTitle>
        <IconButton
          aria-label='close'
          onClick={handleClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Close />
        </IconButton>
      </Box>

      <DialogContent dividers>{children}</DialogContent>
    </Dialog>
  );
};

export default SimpleDialog;
