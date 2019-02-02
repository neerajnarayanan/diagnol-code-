import React from 'react';
import { compose } from 'recompose';

import './App.css';



import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchPosts } from '../src/actions/postActions';

const applyUpdateResult = (result) => (prevState) => ({
  hits: [...prevState.hits, ...result.page["content-items"].content],
  page: parseInt(result.page['page-num-requested']),
  isError: false,
  isLoading: false,
  showSearchBar: false
});

const applySetError = (prevState) => ({
  isError: true,
  isLoading: false,
});


class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hits: [],
      page: 0,
      isLoading: false,
      isError: false,
      showSearchBar: false
    };
  }

  componentWillMount() {
    this.props.fetchPosts(1);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.posts !== nextProps.posts) {
      if (this.props.posts.length > 0) {
        let hits = this.state.hits.concat(nextProps.posts)
        this.setState({
          hits: hits,
          page: this.props.page
        })
      }
      else {
        this.setState({
          hits: nextProps.posts,
          page: this.props.page
        })
      }
    }
  }



  onInitialSearch = (e) => {
    e.preventDefault();
    const { value } = this.input;
    var tempArray = JSON.stringify(this.state.hits);
    if (value === '') {
    this.props.fetchPosts(1);
      return;
    } else {
      let hits = this.state.hits;
      console.log('hits ',hits)
      let res = hits.filter(item => {
        return item.name == value;
      })
      this.setState({
        hits: res
      })
    }
  }

  onPaginatedSearch = (e) => {
    if (this.props.page + 1 < 4 ) {
      this.props.fetchPosts(parseInt(this.props.page) + 1)
    }
  }
  
  showSearchBar = () => {
    this.setState({
      showSearchBar: true
    });

  }

  onSetError = () =>
    this.setState(applySetError);

  render() {
    console.log(this.state)
    return (
      <div className="container">
        <nav className="navbar navbar-expand-sm bg-dark navbar-dark fixed-top">
          <div className="col-4 fontColor"> The Romantic Comedy</div>
          <div className="col-5"></div>
          <form className="form-inline" onSubmit={this.onInitialSearch}>
            {this.state.showSearchBar == true && <input className="form-control mr-sm-2" type="text" ref={node => this.input = node} placeholder="Search" />}
            <a onClick={this.showSearchBar}><img className="image" src={'./images/search.png'} /></a>
          </form>
        </nav>


        {
          this.props.posts.length == 0 &&
          <div className="col-4 fontColor">
            No Results Found
          </div>
        }
        {this.state.hits.length > 0 &&
          <AdvancedList
            list={this.state.hits}
            isError={this.state.isError}
            isLoading={this.state.isLoading}
            page={this.props.page}
            onPaginatedSearch={this.onPaginatedSearch}
          />
        }
      </div>
    );
  }
}

const List = ({ list }) => (
  <div className="row divContent">
    {list.map((item, index) =>
      <div className="col-sm-4 col-xs-1 col-md-4 col-lg-4 centerAlign" key={index}>
        <img className="image" src={'./images/' + item['poster-image']} />
        <div className="fontStyle">{item.name}</div>
      </div>
    )
    }
  </div>
)

const withLoading = (conditionFn) => (Component) => (props) =>
  <div>
    <Component {...props} />

    <div className="interactions">
      {conditionFn(props) && <span>Loading...</span>}
    </div>
  </div>

const withPaginated = (conditionFn) => (Component) => (props) =>
  <div>
    <Component {...props} />

    <div className="interactions">
      {
        conditionFn(props) &&
        <div>
          <div>
            Something went wrong...
          </div>
          <button
            type="button"
            onClick={props.onPaginatedSearch}
          >
            Try Again
          </button>
        </div>
      }
    </div>
  </div>

const withInfiniteScroll = (conditionFn) => (Component) =>
  class WithInfiniteScroll extends React.Component {
    componentDidMount() {
      window.addEventListener('scroll', this.onScroll, false);
    }

    componentWillUnmount() {
      window.removeEventListener('scroll', this.onScroll, false);
    }

    onScroll = () =>
      conditionFn(this.props) && this.props.onPaginatedSearch();

    render() {
      return <Component {...this.props} />;
    }
  }

const paginatedCondition = props =>
  props.page !== null && !props.isLoading && props.isError;

const infiniteScrollCondition = props =>
  (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 500)
  && props.list.length
  && !props.isLoading
  && !props.isError;

const loadingCondition = props =>
  props.isLoading;

const AdvancedList = compose(
  withPaginated(paginatedCondition),
  withInfiniteScroll(infiniteScrollCondition),
  withLoading(loadingCondition),
)(List);

const mapStateToProps = state => {

  return ({
    posts: state.posts.items.page ? state.posts.items.page["content-items"].content : [],
    page: parseInt(state.posts.items.page ? state.posts.items.page['page-num-requested'] : 1)
  })
}

function matchDispatchToProps(dispatch) {
  return bindActionCreators({
    fetchPosts
  }, dispatch);
};
export default connect(mapStateToProps, matchDispatchToProps)(App);
