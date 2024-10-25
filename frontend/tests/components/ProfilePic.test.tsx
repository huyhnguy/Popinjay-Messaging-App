import { render, screen } from '@testing-library/react'
import ProfilePic from '../../src/components/ProfilePic'

describe('ProfilePic Component', () => {
    it('should render component with default profile picture when no imageSrc is given', () => {
        render(<ProfilePic />)

        const defaultPic = screen.getByTitle("default-pic");
        screen.debug();
        expect(defaultPic).toBeInTheDocument();
    })

    it('should render image with src', () => {
        render(<ProfilePic imageSrc="hello"/>)

        const image = screen.getByAltText("profile picture");
        screen.debug();
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', 'hello')
    })
})