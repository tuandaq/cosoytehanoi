"use client"
import { Button, CircularProgress, Alert, Box } from "@mui/material"

const LocationControls = ({ loadingLocation, locationError, routingTarget, onFetchLocation, onClearRoute }) => {
  return (
    <Box width={'30%'}>
      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <Button
          fullWidth
          variant="contained"
          onClick={onFetchLocation}
          disabled={loadingLocation}
          sx={{
            height: 56,
            borderRadius: 2,
            textTransform: "none",
          }}
        >
          {loadingLocation ? <CircularProgress size={24} /> : "Định vị lại"}
        </Button>

        <Button
          fullWidth
          variant="outlined"
          onClick={onClearRoute}
          disabled={routingTarget ? false : true}
          sx={{
            height: 56,
            borderRadius: 2,
            textTransform: "none",
          }}
        >
          Xoá chỉ đường
        </Button>

      </Box>
      {locationError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {locationError}
        </Alert>
      )}
    </Box>
  )
}

export default LocationControls
