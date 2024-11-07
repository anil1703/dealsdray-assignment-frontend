
import Header from '../Header/Header';
import "./Home.css"
import Container from 'react-bootstrap/esm/Container';

const Home = () => {
    return (
        <>
        <Header />
        <Container>
            <div className='homeDiv'>
            <h1>Welcome Admin</h1>
                </div>
        
        </Container>
        </>
        
    )
}

export default Home