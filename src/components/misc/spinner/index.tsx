import React, { CSSProperties } from 'react';
import styles from './styles.module.css';

export default function Spinner({ wrapperStyles }: { wrapperStyles?: CSSProperties }) {
    return (
        <div className={styles.ldsDualRing} style={wrapperStyles}></div>
    )
};