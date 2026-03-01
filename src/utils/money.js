export const formatMoney = (value) => {
  const number = Number(value || 0)

  return number.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}