use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn shuffled_indices(len: u32, seed: u32) -> Vec<u32> {
    // Creates a vector of indices from 0 to len-1
    // Essentially a growable array
    let mut indices: Vec<u32> = (0..len).collect();

    // Keep an Rng State based on the seed we got from TS
    let mut state: u32 = seed;

    // If 0 or 1 element, no need to shuffle
    let n: usize = indices.len();
    if n <= 1 {
        return indices;
    }

    for i in (1..n).rev() {
        let rand_val: u32 = next_u32(&mut state);
        let rand_index: usize = (rand_val as usize) % (i + 1);
        indices.swap(i, rand_index);
    }
    indices
}

fn next_u32(state: &mut u32) -> u32 {
    let a: u32 = 1664525;
    let c: u32 = 1013904223;

    // Update the state in place (note the &mut in the argument).
    *state = state.wrapping_mul(a).wrapping_add(c);

    *state
}
