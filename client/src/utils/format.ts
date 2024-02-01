export function stateName(state_name: string) {
    const stateNames = state_name.split(" ");
    const newStateNames = stateNames.map((state) => state.charAt(0).toUpperCase())
    return newStateNames;
}

export function makePageNavigation(currentPage: number, totalItems: number) {
    let pageNavigation: number[] = [];
    const pageNumber = Math.floor(totalItems / 15)+1;
    if (pageNumber <= 4) {
        for (let i = 1; i <= pageNumber; i++) {
            pageNavigation.push(i);
        }
    } else {
        if (currentPage >= pageNumber-2) {
            pageNavigation = [1, 0, pageNumber-2, pageNumber-1, pageNumber];
        } else if (currentPage <= 3) {
            pageNavigation = [1, 2, 3, 0, pageNumber];
        } else {
            pageNavigation = [currentPage-1, currentPage, currentPage+1, 0, pageNumber];
        }
    }
    return pageNavigation;
}

export const formatShortDocumentName = (document: string): string => {
    const prefix = document.substring(0, 4);
    const suffix = document.slice(-9);
    const middle = '...';
    const formattedName = `${prefix}${middle}${suffix}`;
    
    return formattedName;
  }