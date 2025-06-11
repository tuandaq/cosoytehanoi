"use client"
import { Box, Typography, List, ListItem, ListItemText } from "@mui/material"

const ResultsList = ({ filteredData, onItemClick }) => {
  return (
    <Box
      sx={{
        width: "320px",
        overflowY: "auto",
        border: "1px solid #ddd",
        borderRadius: 1,
        p: 2,
        bgcolor: "#f9f9f9",
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        Danh sách kết quả ({filteredData.length})
      </Typography>
      {filteredData.length > 0 ? (
        <List>
          {filteredData.map((item, idx) => (
            <ListItem
              key={idx}
              sx={{
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "#e3f2fd",
                },
                borderRadius: 1,
                mb: 1,
              }}
              onClick={() => onItemClick(item)}
            >
              <ListItemText
                primary={item.properties.name}
                secondary={item.properties.address + " | Loại hình: " + item.properties.type}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2">Không tìm thấy cơ sở y tế phù hợp.</Typography>
      )}
    </Box>
  )
}

export default ResultsList
