import {Cloudinary} from "@cloudinary/url-gen";

export default function UploadImage() {
    const cld = new Cloudinary({
        cloud: {
          cloudName: 'demo'
        }
      });
}