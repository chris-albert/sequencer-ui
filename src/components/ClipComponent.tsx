import React from 'react'
import {PrimitiveAtom, useAtomValue} from "jotai";
import {getHexColor, UIClip} from "../model/UIStateDisplay";
import {Box} from "@mui/material";
import {zoomAtom} from "../model/Settings";

export type ClipComponentProps = {
  clipAtom: PrimitiveAtom<UIClip>
}

export const ClipComponent: React.FC<ClipComponentProps> = ({
  clipAtom
}) => {

  const clip = useAtomValue(clipAtom)
  const zoom = useAtomValue(zoomAtom)

  if(clip.type === 'real') {
    return (
      <Box
        sx={{
          '&:hover': {
            border: '1px solid white',
            cursor: 'pointer'
          },
          width: 100 + (zoom * 10),
          height: '100%',
          backgroundColor: getHexColor(clip),
        }}
      >
        <Box sx={{p: 1}}>
          {clip.name}
        </Box>
      </Box>
    )
  } else {
    return (
      <Box></Box>
    )
  }


}
