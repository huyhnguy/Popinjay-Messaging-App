import { render, screen } from '@testing-library/react'
import UserProfile from '../../src/components/UserProfile'
import { UserType } from "../types";

vi.mock('react-router-dom', () => ({
    ...vi.importActual('react-router-dom'),
    useNavigate: vi.fn(),
}));

global.fetch = vi.fn();

function createFetchResponse(data: UserType) {
    return { 
        json: () => new Promise((resolve) => resolve(data)) 
    }
}

describe('UserProfile component', () => {
    it('should make GET request to fetch user data', () => {
        const userDataResponse = [
            {
                _id: 1,
                display_name: 'John',
                createdAt: new Date(),
            }
        ]
        const url = '/api/users/1';

        fetch.mockResolvedValue(createFetchResponse(userDataResponse));
        render(<UserProfile userId="1"/>)
        const name = screen.getByRole('header');
        screen.debug();

        expect(fetch).toHaveBeenCalledWith(
            url,
            {
                method: 'GET',
                credentials: "include",
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                }
            }
        )
        expect(name).toHaveTextContent(/john/i);

    })
})