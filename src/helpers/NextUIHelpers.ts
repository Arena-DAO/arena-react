// https://github.com/nextui-org/nextui/issues/1968#issuecomment-1835424861
export const keyboardDelegateFixSpace = Object.fromEntries(
	[
		"getKeyBelow",
		"getKeyAbove",
		"getKeyLeftOf",
		"getKeyRightOf",
		"getKeyPageBelow",
		"getKeyPageAbove",
		"getFirstKey",
		"getLastKey",
		// HAVE TO ignore this one
		// "getKeyForSearch"
	].map((name) => [name, () => null]),
);
