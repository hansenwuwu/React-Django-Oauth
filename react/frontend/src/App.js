import './App.css';
import { Switch, Route, Link } from "react-router-dom";
import Login from "./components/login";
import TestAuth from './components/testAuth';

function App() {
  return (
    <div className="App">
      <nav>
        <Link className={"nav-link"} to={"/"}>Home</Link>
        <Link className={"nav-link"} to={"/login"}>Login</Link>
        <Link className={"nav-link"} to={"/testAuth"}>testAuth</Link>
      </nav>
      <Switch>
        <Route exact path={"/login"} component={Login} />
        <Route exact path={"/testAuth"} component={TestAuth} />
        <Route path={"/"} render={() => <h1>This is Home page!</h1>} />
      </Switch>
    </div>
  );
}

export default App;
