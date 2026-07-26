function jortsort(array) {
  // Clone the array to avoid mutating the original, then sort it in ascending order
  let sortedArray = array.slice().sort((a, b) => a - b);
  
  // Compare the sorted array to the originally provided array
  return sortedArray.every((val, index) => val === array[index]);
}
