"use client"
import { Box, TextField, MenuItem, Select, InputLabel, FormControl } from "@mui/material"

const SearchFilters = ({
  search,
  setSearch,
  filterType,
  setFilterType,
  uniqueTypes,
  onSearchChange,
  onFilterChange,
}) => {
  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    onSearchChange()
  }

  const handleFilterChange = (e) => {
    setFilterType(e.target.value)
    onFilterChange()
  }

  return (
    <Box
      width={'100%'}
      sx={{
        display: "flex",
        gap: 2,
        alignItems: "center",
      }}
    >
      <TextField
        fullWidth
        label="Tìm kiếm cơ sở y tế"
        variant="outlined"
        value={search}
        onChange={handleSearchChange}
        sx={{
          bgcolor: "white",
          borderRadius: 2,
          boxShadow: "0 2px 8px rgb(0 0 0 / 0.1)",
        }}
      />
      <FormControl
        fullWidth
        sx={{
          bgcolor: "white",
          borderRadius: 2,
          boxShadow: "0 2px 8px rgb(0 0 0 / 0.1)",
        }}
      >
        <InputLabel>Loại hình</InputLabel>
        <Select value={filterType} label="Loại hình" onChange={handleFilterChange}>
          <MenuItem value="Tất cả">Tất cả</MenuItem>
          {uniqueTypes.map((type, idx) => (
            <MenuItem key={idx} value={type}>
              {type}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  )
}

export default SearchFilters
