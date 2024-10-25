import { render, screen } from '@testing-library/react'
import Logo from '../../src/components/Logo'

describe('Logo', () => {
    it('should render logo and "Popinjay" header', () => {
        render(<Logo />)

        const heading = screen.getByRole('heading');
        const logo = screen.getByTitle('logo');
        expect(heading).toBeInTheDocument();
        expect(heading).toHaveTextContent(/popinjay/i);
        expect(logo).toBeInTheDocument();
    })
})