import { useNavigate } from "react-router-dom";

const Register: React.FC = () => {
    const navigate = useNavigate();
    const gotoLoginPage = () => {
        navigate("/login")
    }

    return (
        <>
            <p>Register Page</p>
            <button onClick={gotoLoginPage}>Go to Login</button>
        </>
    )
}

export default Register;