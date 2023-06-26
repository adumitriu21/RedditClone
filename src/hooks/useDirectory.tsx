import React from 'react';
import { useRecoilState } from 'recoil';
import { directoryMenuState } from '../atoms/directoryModalAtom';

const useDirectory = () => {
    const [directoryState, setDirectoryState] = useRecoilState(directoryMenuState)
    
    return { directoryState}
}
export default useDirectory;