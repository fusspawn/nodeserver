// Pixel Spaceships
// David Bollinger - July 2006
// http://www.davebollinger.com
// for Processing 0115 beta
// (updated for 0119 Beta)
// Modified by fusspawn (ariochofmelnibone@gmail.com) for gamecontent generation and processing.js use

PixelSpaceshipFitter fitter;
PixelSpaceship ship;
miniMT rng; // want a slightly more robust rng for 32 significant bits
int currentSeed = 0;
boolean needsaving = false;
boolean firstrun = true;
void setup() {
  size(48, 48);
  frameRate(30);
  ship = new PixelSpaceship();
  ship.setScales(4,4);
  
  background(0);
  ship.setSeed(random(999999));
  ship.generate();
  ship.recolor();
}

void next() {
   if(need_new && !firstrun) {
	    save_robot(ship.seed, ship.colorseed);
		need_new = false;
   }
	 
  firstrun = false;

  background(0);
  ship.setSeed(random(999999));
  ship.generate();
  ship.recolor();
}

void draw() {		
	ship.draw(0,0);
	if(need_new)
		next();
}

  
 // the generator
class PixelSpaceship {
  static final int cols = 12;
  static final int rows = 12;
  static final int EMPTY = 0;
  static final int AVOID = 1;
  static final int SOLID = 2;
  static final int COKPT = 3; // ::added to aid coloring
  public int seed;
  public int colorseed; // ::added to aid coloring
  int[][] grid;
  int xscale, yscale;
  int xmargin, ymargin;
  PixelSpaceship() {
    grid = new int[rows][cols];
    xscale = yscale = 1;
    xmargin = ymargin = 0;
  }
  void recolor() { // ::added to aid coloring
    colorseed = random(999999);
  }
  int getHeight() {
    return rows*yscale + ymargin*2;
  }
  int getWidth() {
    return cols*xscale + xmargin*2;
  }
  void setMargins(int xm, int ym) {
    xmargin = xm;
    ymargin = ym;
  }
  void setScales(int xs, int ys) {
    xscale = xs;
    yscale = ys;
  }
  void setSeed(int s) {
    seed = s;
  }
  void wipe() {
    for (int r=0; r<rows; r++)
      for (int c=0; c<cols; c++)
        grid[r][c] = EMPTY;
  } // wipe()
  void generate() {
    wipe();
     // FILL IN THE REQUIRED SOLID CELLS
    int [] solidcs = { 5,5,5,5,5 };
    int [] solidrs = { 2,3,4,5,9 };
    for (int i=0; i<5; i++) {
      int c = solidcs[i];
      int r = solidrs[i];
      grid[r][c] = SOLID;
    }
    // FILL IN THE SEED-SPECIFIED BODY CELLS, AVOID OR EMPTY
    int [] avoidcs = { 4,5,4,3,4,3,4,2,3,4,1,2,3,1,2,3,1,2,3,1,2,3,4,3,4,5 };
    int [] avoidrs = { 1,1,2,3,3,4,4,5,5,5,6,6,6,7,7,7,8,8,8,9,9,9,9,10,10,10 };
    int bitmask = 1;
    for (int i=0; i<26; i++) {
      int c = avoidcs[i];
      int r = avoidrs[i];
      grid[r][c] = ((seed & bitmask) != 0) ? AVOID : EMPTY;
      bitmask <<= 1;
    }
    // FLIP THE SEED-SPECIFIED COCKPIT CELLS, SOLID OR EMPTY
    int [] emptycs = { 4,5,4,5,4,5 };
    int [] emptyrs = { 6,6,7,7,8,8 };
    bitmask = 1 << 26;
    for (int i=0; i<6; i++) {
      int c = emptycs[i];
      int r = emptyrs[i];
      grid[r][c] = ((seed & bitmask) != 0) ? SOLID : COKPT; // ::added to aid coloring
      bitmask <<= 1;
    }
    // SKINNING -- wrap the AVOIDs with SOLIDs where EMPTY
    for (int r=0; r<rows; r++) {
      for (int c=0; c<cols; c++) {
        int here = grid[r][c];
        if (here != EMPTY) continue;
        boolean needsolid = false;
        if ((c>0) && (grid[r][c-1]==AVOID)) needsolid=true;
        if ((c<cols-1) && (grid[r][c+1]==AVOID)) needsolid=true;
        if ((r>0) && (grid[r-1][c]==AVOID)) needsolid=true;
        if ((r<rows-1) && (grid[r+1][c]==AVOID)) needsolid=true;
        if (needsolid)
          grid[r][c] = SOLID;
      }
    }
    // mirror left side into right side
    for (int r=0; r<rows; r++) {
      for (int c=0; c<cols/2; c++)
        grid[r][cols-1-c] = grid[r][c];
    }
  }
  void draw(int basex, int basey) {
    // ::added to aid coloring
    // here's one (of many) possible ways you might color them...
    float[] sats = { 40,60,80,100,80,60, 80,100,120, 100,80,60 };
    float[] bris = { 40,70,100,130,160,190,220, 220,190,160,130,100,70,40 };

    noStroke();
    for (int r=0; r<rows; r++) {
      for (int c=0; c<cols; c++) {
        int x1 = basex + xmargin + c * xscale;
        int y1 = basey + ymargin + r * yscale;
        int m = grid[r][c];
        // ::added to aid coloring
        // for monochrome just draw SOLID's as black and you're done
        // otherwise...
        if (m==SOLID) {
          fill(#000000);
          rect(x1,y1,xscale,yscale);      
        }
        else
        if (m == AVOID) {
          float mysat = sats[r];
          float mybri = bris[c]; //+90;
          int h = 0;
          if (r < 6) h = (colorseed & 0xff00) >> 8;
          else if (r < 9) h = (colorseed & 0xff0000) >> 16;
          else h = (colorseed & 0xff000000) >> 24;
          colorMode(HSB);
          fill(h, mysat, mybri);
          rect(x1,y1,xscale,yscale);      
        }   
        else     
        if (m == COKPT) {
          float mysat = sats[c];
          float mybri = bris[r]+40;
          colorMode(HSB);
          int h = (colorseed & 0xff);
          fill(h, mysat, mybri);
          rect(x1,y1,xscale,yscale);      
        }        
      }
    }
  }
}

class PixelSpaceshipFitter {
  PixelSpaceship ship;
  int cols, rows;
  int col, row;
  int seed;
  // cells store the box fit pattern, contents are byte encoded as:
  // (cell >> 16) & 0xff == work to do
  // (cell) & 0xff == size of allocated area
  // (this somewhat odd encoding scheme is a remnant of the
  //  fractal subdivision method used for the pixel robots t-shirt image)
  int [][] cells;
  // the types of work that may occur in a cell
  static final int WORK_NONE = 0;
  static final int WORK_DONE = 1;
  PixelSpaceshipFitter(int c, int r) {
    cols = c;
    rows = r;
    ship = new PixelSpaceship();
    cells = new int[rows][cols];
  }
  // reset the pattern grid
  void wipe() {
    for (int r=0; r<rows; r++)
      for (int c=0; c<cols; c++)
        cells[r][c] = 0; 
    col = row = 0;
  }
  // determines if cells already contain defined area(s)
  boolean isOccupied(int col, int row, int wid, int hei) {
    for (int r=row; r<row+hei; r++) {
      for (int c=col; c<col+wid; c++) {
        if (cells[r][c] != 0) {
          return true;
        }
      }
    }
    return false;
  }
  // marks cells as containing an area
  void doOccupy(int col, int row, int wid, int hei, int val) {
    for (int r=row; r<row+hei; r++) {
      for (int c=col; c<col+wid; c++) {
        cells[r][c] = val;
      }
    }
  }  
  // define the pattern grid
  void make(int s) {
    seed = s;
    randomSeed(seed);
    wipe();
    for (int r=0; r<rows; r++) {
      for (int c=0; c<cols; c++) {
        int cell = cells[r][c];
        if (cell != 0) continue;
        // figure out the size of area to occupy
        int sizer, limit;
        do {
          limit = min(cols-c, rows-r);
          limit = min(limit, 8);
          sizer = int(random(limit))+1;
        } while(isOccupied(c,r,sizer,sizer));
        // flag all cells as occupied by width x height area
        doOccupy(c,r,sizer,sizer,sizer);
        // indicate work to perform in upper-left cell
        int work = WORK_DONE;
        cells[r][c] |= (work<<16);
      } // for c
    } // for r
  }
  // is cursor at 0,0
  boolean at00() {
    return ((col==0) && (row==0));
  }
  // step the cursor forward
  void advance(int advcol) {
    col += advcol;
    if (col >= cols) {
      col = 0;
      row++;
      if (row >= rows) {
        row = 0;
      }
    }
  }
  // advance through the pattern and draw the next robot
  void drawone() {
    boolean drawn = false;
    do {
      int cell = cells[row][col];
      int work = (cell>>16) & 0xff;
      int sizer = (cell) & 0xff;
      if (work != WORK_NONE) {
        int y1 = 16*row;
        int x1 = 16*col;
        ship.setScales( sizer, sizer );
        ship.setMargins( 2*sizer, 2*sizer );
        ship.setSeed(random(99999));
        ship.generate();
        ship.recolor();
        ship.draw( x1, y1 );
        drawn = true;
      }
      advance(sizer);
      if (at00()) return;
    } while (!drawn);
  }
}

// a minimal version of the Mersenne Twister
class miniMT {
  private long seed;
  private static final int N = 624;
  private static final int M = 397;
  private static final int MATRIX_A = 0x9908b0df;
  private static final int UPPER_MASK = 0x80000000;
  private static final int LOWER_MASK = 0x7fffffff;
  private static final int TEMPERING_MASK_B = 0x9d2c5680;
  private static final int TEMPERING_MASK_C = 0xefc60000;
  private int mt[];
  private int mti;
  private int mag01[] = { 0x0, MATRIX_A };
  public miniMT() {
    this.setSeed(0);
  }
  public miniMT(long seed) {
    this.setSeed(seed);
  }
  public void setSeed(final long _seed) {
    seed=_seed;
    mt = new int[N];
    mt[0]= (int)(seed & 0xfffffff);
    for (mti=1; mti<N; mti++) {
      mt[mti] = (1812433253 * (mt[mti-1] ^ (mt[mti-1] >>> 30)) + mti);
      mt[mti] &= 0xffffffff;
    }
  }
  public final int generate() {
    int y;
    if (mti >= N) {
      int kk;
      for (kk = 0; kk < N - M; kk++) {
        y = (mt[kk] & UPPER_MASK) | (mt[kk+1] & LOWER_MASK);
        mt[kk] = mt[kk+M] ^ (y >>> 1) ^ mag01[y & 0x1];
      }
      for (; kk < N-1; kk++) {
        y = (mt[kk] & UPPER_MASK) | (mt[kk+1] & LOWER_MASK);
        mt[kk] = mt[kk+(M-N)] ^ (y >>> 1) ^ mag01[y & 0x1];
      }
      y = (mt[N-1] & UPPER_MASK) | (mt[0] & LOWER_MASK);
      mt[N-1] = mt[M-1] ^ (y >>> 1) ^ mag01[y & 0x1];
      mti = 0;
    }
    y = mt[mti++];
    y ^= y >>> 11;
    y ^= (y << 7) & TEMPERING_MASK_B;
    y ^= (y << 15) & TEMPERING_MASK_C;
    y ^= (y >>> 18);
    return y;
  }
}
