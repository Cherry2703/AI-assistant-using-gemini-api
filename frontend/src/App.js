import {BrowserRouter,Routes,Route} from 'react-router-dom'

import ContactSupport from './Components/ContactSupport'

const App = () =>{
  return(
    <BrowserRouter>
      <Routes>
        <Route path='/' Component={ContactSupport}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App