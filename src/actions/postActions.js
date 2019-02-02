

export const fetchPosts = (page) => dispatch => {
    fetch('./API/CONTENTLISTINGPAGE-PAGE'+ page +'.json')
        .then(res => res.json())
        .then(posts => {dispatch({
            type: 'FETCH_POSTS',
            payload: posts
        }),
    console.log('in service call',posts,page)}
        );
}



