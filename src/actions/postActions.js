

export const fetchPosts = (page=1) => dispatch => {
    fetch('./API/CONTENTLISTINGPAGE-PAGE'+ page +'.json')
        .then(res => res.json())
        .then(posts => dispatch({
            type: 'FETCH_POSTS',
            payload: posts
        }));
}



