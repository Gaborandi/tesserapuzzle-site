// Extracted unchanged from Tessera Logic generator; see local evidence manifest.
(function(root){
function mulberry32(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function hashSeed(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

// Active RNG — defaults to Math.random, swapped to seeded for Journey/Daily
var activeRng = Math.random;

function cellIndex(r, c, n) { return r * n + c; }
function cellRC(i, n) { return [Math.floor(i / n), i % n]; }

function getNeighbors(r, c, n) {
  var result = [];
  if (r > 0) result.push([r-1, c]);
  if (r < n-1) result.push([r+1, c]);
  if (c > 0) result.push([r, c-1]);
  if (c < n-1) result.push([r, c+1]);
  return result;
}

function shuffle(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(activeRng() * (i + 1));
    var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
  }
  return arr;
}

function isConnected(cells, n) {
  if (cells.length <= 1) return true;
  var set = {};
  for (var i = 0; i < cells.length; i++) set[cellIndex(cells[i][0], cells[i][1], n)] = true;
  var visited = {};
  var queue = [cells[0]];
  visited[cellIndex(cells[0][0], cells[0][1], n)] = true;
  var count = 1;
  while (queue.length > 0) {
    var cur = queue.shift();
    var nbrs = getNeighbors(cur[0], cur[1], n);
    for (var i = 0; i < nbrs.length; i++) {
      var id = cellIndex(nbrs[i][0], nbrs[i][1], n);
      if (set[id] && !visited[id]) { visited[id] = true; count++; queue.push(nbrs[i]); }
    }
  }
  return count === cells.length;
}

function checkRemainingConnectivity(assignment, regionSize, n, currentRegion) {
  var total = n * n;
  var unassigned = [];
  for (var i = 0; i < total; i++) { if (assignment[i] === -1) unassigned.push(i); }
  if (unassigned.length === 0) return true;

  // Count how many cells the current region still needs
  var cellsStillNeeded = 0;
  if (currentRegion !== undefined) {
    var currentCount = 0;
    for (var i = 0; i < total; i++) { if (assignment[i] === currentRegion) currentCount++; }
    cellsStillNeeded = regionSize - currentCount;
  }

  var remaining = {};
  for (var i = 0; i < unassigned.length; i++) remaining[unassigned[i]] = true;
  while (true) {
    var first = -1;
    for (var k in remaining) { first = parseInt(k); break; }
    if (first === -1) break;
    var comp = {};
    var q = [first];
    comp[first] = true;
    var sz = 1;
    while (q.length > 0) {
      var curr = q.shift();
      var rc = cellRC(curr, n);
      var nbrs = getNeighbors(rc[0], rc[1], n);
      for (var i = 0; i < nbrs.length; i++) {
        var ni = cellIndex(nbrs[i][0], nbrs[i][1], n);
        if (remaining[ni] && !comp[ni]) { comp[ni] = true; sz++; q.push(ni); }
      }
    }

    // Check if this component is adjacent to the currently-growing region
    var adjToCurrentRegion = false;
    if (cellsStillNeeded > 0) {
      for (var k in comp) {
        var rc = cellRC(parseInt(k), n);
        var nbrs = getNeighbors(rc[0], rc[1], n);
        for (var i = 0; i < nbrs.length; i++) {
          if (assignment[cellIndex(nbrs[i][0], nbrs[i][1], n)] === currentRegion) {
            adjToCurrentRegion = true; break;
          }
        }
        if (adjToCurrentRegion) break;
      }
    }

    if (adjToCurrentRegion) {
      // This component must accommodate the rest of the current region plus full future regions
      if (sz < cellsStillNeeded) return false;
      if ((sz - cellsStillNeeded) % regionSize !== 0) return false;
    } else {
      // This component must be exactly divisible into full regions
      if (sz % regionSize !== 0) return false;
    }

    for (var k in comp) delete remaining[k];
  }
  return true;
}

function generatePartition(n, regionSize, numRegions) {
  var total = n * n;
  for (var attempt = 0; attempt < 400; attempt++) {
    var assignment = [];
    for (var i = 0; i < total; i++) assignment[i] = -1;
    var success = true;
    for (var region = 0; region < numRegions; region++) {
      var start = -1;
      if (region === 0) {
        start = Math.floor(activeRng() * total);
      } else {
        var candidates = [];
        for (var i = 0; i < total; i++) {
          if (assignment[i] !== -1) continue;
          var rc = cellRC(i, n);
          var nbrs = getNeighbors(rc[0], rc[1], n);
          var hasAdj = false;
          for (var j = 0; j < nbrs.length; j++) {
            if (assignment[cellIndex(nbrs[j][0], nbrs[j][1], n)] !== -1) { hasAdj = true; break; }
          }
          if (hasAdj) candidates.push(i);
        }
        if (candidates.length === 0) { success = false; break; }
        start = candidates[Math.floor(activeRng() * candidates.length)];
      }
      var regionCells = [start];
      assignment[start] = region;
      var frontier = [];
      var startRC = cellRC(start, n);
      var nbrs = getNeighbors(startRC[0], startRC[1], n);
      for (var j = 0; j < nbrs.length; j++) {
        var ni = cellIndex(nbrs[j][0], nbrs[j][1], n);
        if (assignment[ni] === -1) frontier.push(ni);
      }
      while (regionCells.length < regionSize && frontier.length > 0) {
        shuffle(frontier);
        var added = false;
        for (var fi = 0; fi < frontier.length; fi++) {
          var ci = frontier[fi];
          if (assignment[ci] !== -1) continue;
          assignment[ci] = region;
          if (checkRemainingConnectivity(assignment, regionSize, n, region)) {
            regionCells.push(ci);
            var rc2 = cellRC(ci, n);
            var nbrs2 = getNeighbors(rc2[0], rc2[1], n);
            for (var j = 0; j < nbrs2.length; j++) {
              var ni2 = cellIndex(nbrs2[j][0], nbrs2[j][1], n);
              if (assignment[ni2] === -1 && frontier.indexOf(ni2) === -1) frontier.push(ni2);
            }
            frontier = frontier.filter(function(f) { return assignment[f] === -1; });
            added = true;
            break;
          } else {
            assignment[ci] = -1;
          }
        }
        if (!added) { success = false; break; }
      }
      if (!success || regionCells.length !== regionSize) { success = false; break; }
    }
    if (success && assignment.indexOf(-1) === -1) {
      var result = [];
      for (var r = 0; r < n; r++) {
        result.push([]);
        for (var c = 0; c < n; c++) result[r].push(assignment[cellIndex(r, c, n)]);
      }
      return result;
    }
  }
  return null;
}

function scorePartitionQuality(partition, n, numRegions) {
  var score = 0;
  for (var reg = 0; reg < numRegions; reg++) {
    var cells = [];
    for (var r = 0; r < n; r++) {
      for (var c = 0; c < n; c++) {
        if (partition[r][c] === reg) cells.push([r, c]);
      }
    }
    if (cells.length === 0) continue;

    // 1. Compactness: bounding box area vs actual cell count
    var minR = n, maxR = 0, minC = n, maxC = 0;
    for (var i = 0; i < cells.length; i++) {
      if (cells[i][0] < minR) minR = cells[i][0];
      if (cells[i][0] > maxR) maxR = cells[i][0];
      if (cells[i][1] < minC) minC = cells[i][1];
      if (cells[i][1] > maxC) maxC = cells[i][1];
    }
    var bbArea = (maxR - minR + 1) * (maxC - minC + 1);
    var compactness = cells.length / bbArea; // 1.0 = perfect rect, lower = snakier

    // 2. Perimeter: more border edges = more interesting shape
    var borderEdges = 0;
    for (var i = 0; i < cells.length; i++) {
      var cr = cells[i][0], cc = cells[i][1];
      var nbrs = [[cr-1,cc],[cr+1,cc],[cr,cc-1],[cr,cc+1]];
      for (var j = 0; j < 4; j++) {
        var nr = nbrs[j][0], nc = nbrs[j][1];
        if (nr < 0 || nr >= n || nc < 0 || nc >= n || partition[nr][nc] !== reg) {
          borderEdges++;
        }
      }
    }
    var perimeterScore = borderEdges / (4 * cells.length); // 0-1 range

    // Ideal: moderate compactness (not a snake, not a rectangle) + interesting perimeter
    // Perfect rectangle: compactness=1.0, perimeterScore~low → penalize
    // Long snake: compactness~low, perimeterScore~high → penalize
    // Interesting shape: compactness 0.5-0.8, perimeterScore moderate → reward
    var shapeScore = compactness * 0.7 + perimeterScore * 0.3;

    // Bonus: penalize perfectly rectangular regions (boring)
    var isRect = (bbArea === cells.length);
    if (isRect && cells.length > 3) shapeScore *= 0.7; // 30% penalty for rectangles

    score += shapeScore;
  }
  return score / numRegions; // normalize 0-1 range
}

function assignNumbers(partition, n, regionSize) {
  var grid = [];
  for (var r = 0; r < n; r++) { grid.push([]); for (var c = 0; c < n; c++) grid[r].push(0); }
  var regionCells = {};
  for (var r = 0; r < n; r++) {
    for (var c = 0; c < n; c++) {
      var reg = partition[r][c];
      if (!regionCells[reg]) regionCells[reg] = [];
      regionCells[reg].push([r, c]);
    }
  }
  for (var reg in regionCells) {
    var cells = regionCells[reg];
    var nums = [];
    for (var i = 1; i <= regionSize; i++) nums.push(i);
    shuffle(nums);
    for (var i = 0; i < cells.length; i++) grid[cells[i][0]][cells[i][1]] = nums[i];
  }
  return grid;
}

function countSolutionsBFS(grid, n, regionSize, numRegions, maxSolutions) {
  // Keep the public helper name, but count exact covers of complete connected
  // territories. Growing labels in row order misses U-shaped territories whose
  // early cells connect through a later row and can falsely report uniqueness.
  // Uniqueness is supported only for the small Logic grids; larger boards use
  // rule validation without a uniqueness promise.
  var total = n * n;
  if (!Number.isInteger(n) || n < 1 || n > 5 ||
      !Number.isInteger(regionSize) || regionSize < 1 || regionSize > 25 ||
      regionSize * numRegions !== total) return 0;
  var limit = Number.isInteger(maxSolutions) && maxSolutions > 0 ? maxSolutions : 2;
  var allCells = (1 << total) - 1;
  var neighborMasks = [], values = [], byCell = [];
  for (var i = 0; i < total; i++) {
    var row = Math.floor(i / n), col = i % n;
    var value = grid[row] && grid[row][col];
    if (!Number.isInteger(value) || value < 1 || value > regionSize) return 0;
    values[i] = 1 << (value - 1);
    byCell[i] = [];
    var neighbors = getNeighbors(row, col, n), mask = 0;
    for (var j = 0; j < neighbors.length; j++) mask |= 1 << cellIndex(neighbors[j][0], neighbors[j][1], n);
    neighborMasks[i] = mask;
  }
  var seen = new Set();
  function growTerritory(mask, numberMask, count, frontier) {
    if (seen.has(mask)) return;
    seen.add(mask);
    if (count === regionSize) {
      for (var i = 0; i < total; i++) if (mask & (1 << i)) byCell[i].push(mask);
      return;
    }
    for (var remaining = frontier; remaining; remaining &= remaining - 1) {
      var bit = remaining & -remaining;
      var next = 31 - Math.clz32(bit);
      if (numberMask & values[next]) continue;
      var nextMask = mask | bit;
      growTerritory(nextMask, numberMask | values[next], count + 1,
        (frontier | neighborMasks[next]) & ~nextMask);
    }
  }
  for (var i = 0; i < total; i++) growTerritory(1 << i, values[i], 1, neighborMasks[i]);

  var impossible = new Set();
  function countCovers(used) {
    if (used === allCells) return 1;
    if (impossible.has(used)) return 0;
    var choices = null;
    for (var i = 0; i < total; i++) {
      if (used & (1 << i)) continue;
      var compatible = byCell[i].filter(function(mask) { return !(mask & used); });
      if (compatible.length === 0) { impossible.add(used); return 0; }
      if (!choices || compatible.length < choices.length) choices = compatible;
    }
    var count = 0;
    for (var j = 0; j < choices.length; j++) {
      count += countCovers(used | choices[j]);
      if (count >= limit) return limit;
    }
    if (count === 0) impossible.add(used);
    return count;
  }
  return countCovers(0);
}

// Last-resort fixtures for the grid sizes where uniqueness is a release
// guarantee. Counterexamples and an independent small-board oracle accompany
// the generator's complete-territory solver in the regression suite.
var VERIFIED_UNIQUE_FALLBACKS = {
  '3:3:3': {
    grid: [[2,3,1],[2,3,1],[2,1,3]],
    solution: [[1,1,1],[0,0,0],[2,2,2]]
  },
  '4:4:4': {
    grid: [[3,3,3,1],[2,4,1,2],[4,1,2,4],[3,2,1,4]],
    solution: [[0,1,2,2],[0,1,1,2],[0,0,1,2],[3,3,3,3]]
  },
  '5:5:5': {
    grid: [[5,3,1,3,5],[4,1,2,2,4],[2,1,5,2,3],[4,5,4,1,3],[1,3,4,2,5]],
    solution: [[2,2,0,0,0],[2,2,2,0,0],[4,1,1,1,1],[4,4,1,3,3],[4,4,3,3,3]]
  }
};

function getVerifiedUniqueFallback(n, regionSize, numRegions) {
  var fixture = VERIFIED_UNIQUE_FALLBACKS[n + ':' + regionSize + ':' + numRegions];
  if (!fixture) return null;
  return {
    grid: fixture.grid.map(function(row) { return row.slice(); }),
    solution: fixture.solution.map(function(row) { return row.slice(); })
  };
}

// Generate puzzle from raw config object
// config: { gridSize, regionSize, numRegions, seed?, checkUniqueness?, maxAttempts?, numAssignAttempts? }
function generatePuzzleFromConfig(config) {
  var n = config.gridSize, regionSize = config.regionSize, numRegions = config.numRegions;
  var checkUniqueness = config.checkUniqueness || false;
  var maxAttempts = config.maxAttempts || 30;
  var numAssignAttempts = config.numAssignAttempts || 3;

  // Install seeded RNG if seed provided, otherwise use Math.random
  var prevRng = activeRng;
  if (config.seed != null) {
    activeRng = mulberry32(typeof config.seed === 'string' ? hashSeed(config.seed) : config.seed);
  }

  try {
    var MIN_PARTITION_QUALITY = 0.55; // reject bottom ~30% of partition shapes
    for (var attempt = 0; attempt < maxAttempts; attempt++) {
      var partition = generatePartition(n, regionSize, numRegions);
      if (!partition) continue;

      // Quality gate: reject boring partitions (but always accept in last 5 attempts)
      if (attempt < maxAttempts - 5 && n >= 4) {
        var quality = scorePartitionQuality(partition, n, numRegions);
        if (quality < MIN_PARTITION_QUALITY) continue;
      }

      for (var numAttempt = 0; numAttempt < numAssignAttempts; numAttempt++) {
        var grid = assignNumbers(partition, n, regionSize);
        if (checkUniqueness) {
          var solCount = countSolutionsBFS(grid, n, regionSize, numRegions, 2);
          if (solCount === 1) return { grid: grid, solution: partition };
        } else {
          return { grid: grid, solution: partition };
        }
      }
    }
    var partition = generatePartition(n, regionSize, numRegions);
    if (partition) {
      if (checkUniqueness && n <= 5) {
        for (var fa = 0; fa < numAssignAttempts; fa++) {
          var grid = assignNumbers(partition, n, regionSize);
          if (countSolutionsBFS(grid, n, regionSize, numRegions, 2) === 1) return { grid: grid, solution: partition };
        }
      } else {
        return { grid: assignNumbers(partition, n, regionSize), solution: partition };
      }
    }

    if (checkUniqueness && n <= 5) {
      var verifiedFallback = getVerifiedUniqueFallback(n, regionSize, numRegions);
      if (verifiedFallback) return verifiedFallback;
      throw new Error('No verified unique fallback for ' + n + 'x' + n + ' puzzle configuration');
    }

    // Fallback: row-stripe partition
    var fallPartition = [];
    for (var r = 0; r < n; r++) { fallPartition.push([]); for (var c = 0; c < n; c++) fallPartition[r].push(r); }
    return { grid: assignNumbers(fallPartition, n, regionSize), solution: fallPartition };
  } finally {
    activeRng = prevRng;
  }
}


root.TesseraDailyGenerator={hashSeed:hashSeed,generatePuzzleFromConfig:generatePuzzleFromConfig,countSolutionsBFS:countSolutionsBFS};
})(window);
