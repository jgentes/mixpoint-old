import fetch from 'isomorphic-fetch';

const SPOTIFY_URI = 'https://api.github.com/search/users';

export function makeAndHandleRequest(query, page = 1) {
    return fetch(`${SEARCH_URI}?q=${query}+in:login&page=${page}&per_page=50`)
        .then((resp) => resp.json())
        .then(({ items, total_count }) => {
            const options = items.map((i) => ({
                avatar_url: i.avatar_url,
                id: i.id,
                login: i.login,
            }));
            return { options, total_count };
        });
}

export const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};

export const move = (source, destination, droppableSource, droppableDestination) => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const [removed] = sourceClone.splice(droppableSource.index, 1);

    destClone.splice(droppableDestination.index, 0, removed);

    const result = {};
    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;

    return result;
};