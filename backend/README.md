// This backend implements the Virtual File System for the ace editor.
// I have decided to use a new architecture which is like bellow
// +----------------------------------------------------------------+
// +                                                                +
// +      +------------------+          +--------------------+      +
// +      +  +------------+  + -------> +                    +      +
// +      +  +  backend   +  +          +      database      +      +
// +      +  +------------+  + <------- +       (redb)       +      +
// +      +        vfs       +          +                    +      +
// +      +------------------+          +--------------------+      +
// +                                                                +
// +                        Physical Disk                           +
// +----------------------------------------------------------------+