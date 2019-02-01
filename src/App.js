import React from 'react';
import { compose } from 'recompose';

import './App.css';

const applyUpdateResult = (result) => (prevState) => ({
  hits: [...prevState.hits, ... result.page["content-items"].content],
  page: 1,
  isError: false,
  isLoading: false,
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
      page: 1,
      isLoading: false,
      isError: false,
    };
  }

  componentWillMount() {
    this.fetchStories('',1);
  }

  onInitialSearch = (e) => {
    e.preventDefault();
    const { value } = this.input;
    if (value === '') {
      return;
    } else {
      if(this.state.hits.length ==0) {
        this.fetchStories('',1);
      }
      let res = this.state.hits.filter(item=>{
        return item.name == value;
      })
      // if(res) {
        this.setState({
          hits:res
        })
      // }
     
    }
  }

  onPaginatedSearch = (e) => {
    this.fetchStories(this.input.value, this.state.page + 1);
  }

  fetchStories = (value, page) => {
    this.setState({ isLoading: true });
      fetch('./API/CONTENTLISTINGPAGE-PAGE'+ page +'.json')
      .then((response) => {
         return response.json()
      })
      .then((result) => {
        console.log('ghgbj ',result)
       this.onSetResult(result,page)
      }
        )
      .catch(this.onSetError);
  }

  onSetResult = (result, page) =>
    page === 0
      ? this.setState({
        hits:result.page["content-items"].content,
        page: result.page['page-num-requested'],
        isError: false,
        isLoading: false,
      }, () => console.log(this.state))
      : this.setState(applyUpdateResult(result));

  onSetError = () =>
    this.setState(applySetError);

  render() {
    console.log(this.state.hits)
    return (
      <div className="page">
        <div className="interactions">
          <form type="submit" onSubmit={this.onInitialSearch}>
            <input type="text" ref={node => this.input = node} />
            <button type="submit">Search</button>
          </form>
        </div>
        {
          this.state.hits.length == 0 && 
          <div className="list">
            No Results Found
          </div>
        }
        <AdvancedList
          list={this.state.hits}
          isError={this.state.isError}
          isLoading={this.state.isLoading}
          page={this.state.page}
          onPaginatedSearch={this.onPaginatedSearch}
        />
      </div>
    );
  }
}

const List = ({ list }) =>(
  <div className="list">
    {list.map((item ,index )=> 
    <div className="list-row" key = {index }>
    <img src={'./images/'+item['poster-image']}/>
    {item.name}
    <br/>
      </div>)}
  </div>)

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

export default App;
