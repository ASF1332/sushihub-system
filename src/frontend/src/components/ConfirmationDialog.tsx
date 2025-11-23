import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button
} from '@mui/material';
import React from 'react';

interface ConfirmationDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message?: string;
    children?: React.ReactNode;
}

export function ConfirmationDialog({ open, onClose, onConfirm, title, message, children }: ConfirmationDialogProps) {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                {message && <DialogContentText sx={{ mb: 2 }}>{message}</DialogContentText>}
                {children}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Cancelar</Button>
                <Button onClick={onConfirm} color="error" variant="contained" autoFocus>
                    Confirmar
                </Button>
            </DialogActions>
        </Dialog>
    );
}