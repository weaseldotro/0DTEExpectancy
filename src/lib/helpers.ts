export const roundNumberToString = (x: number): string => {
	return (Math.round(x * 100) / 100).toFixed(2)
}
